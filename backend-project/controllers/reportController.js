const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Allowance = require('../models/Allowance');
const Deduction = require("../models/Deduction");

// Helper function to format payroll data with allowances and deductions
const formatPayrollData = async (payroll, employee) => {
  if (!employee) {
    return {
      employeeId: null,
      employeeName: 'Unknown Employee',
      employeeEmail: 'N/A',
      basicSalary: payroll.basicSalary,
      paymentMonth: payroll.payMonth,
      paymentDate: payroll.paymentDate,
      totalSalary: payroll.totalSalary,
      totalAllowances: 0,
      totalDeductions: 0,
      netSalary: payroll.totalSalary
    };
  }

  const allowances = await Allowance.find({ employee: employee._id });
  const deductions = await Deduction.find({ employee: employee._id });

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return {
    employeeId: employee._id,
    employeeName: employee.name,
    employeeEmail: employee.email,
    basicSalary: payroll.basicSalary,
    paymentMonth: payroll.payMonth,
    paymentDate: payroll.paymentDate,
    totalSalary: payroll.totalSalary,
    totalAllowances,
    totalDeductions,
    netSalary: payroll.totalSalary + totalAllowances - totalDeductions
  };
};

// Main unified endpoint handler
const getReport = async (req, res) => {
  try {
    const { employeeId, payMonth } = req.body;
    
    let query = {};
    let employeeFilter = {};
    
    // First Conditional: Check if employeeId is provided
    if (employeeId && employeeId.trim() !== '' && employeeId !== 'all') {
      // Specific employee case
      employeeFilter._id = employeeId;
      
      // Verify employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      // If payMonth is also provided
      if (payMonth && payMonth.trim() !== '' && payMonth !== 'all') {
        // Case 1: Specific employee + specific month
        query = { employee: employeeId, payMonth };
      } else {
        // Case 2: Specific employee + all months
        query = { employee: employeeId };
      }
    } else {
      // Case 3: All employees
      if (payMonth && payMonth.trim() !== '' && payMonth !== 'all') {
        // Case 3a: All employees + specific month
        query = { payMonth };
      } else {
        // Case 3b: All employees + all months (default)
        query = {};
      }
    }
    
    // Fetch payrolls based on constructed query
    let payrolls = await Payroll.find(query)
      .populate('employee')
      .sort({ paymentDate: -1 });
    
    // If no payrolls found
    if (!payrolls.length) {
      return res.status(404).json({
        success: false,
        message: 'No payroll records found matching the criteria',
        criteria: { employeeId: employeeId || 'all', payMonth: payMonth || 'all' }
      });
    }
    
    // Format all payroll data
    const formattedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        return await formatPayrollData(payroll, payroll.employee);
      })
    );
    
    // Prepare response summary
    const response = {
      success: true,
      summary: {
        totalRecords: formattedPayrolls.length,
        employeeFilter: employeeId === 'all' || !employeeId ? 'All Employees' : `Specific Employee: ${employeeId}`,
        monthFilter: payMonth === 'all' || !payMonth ? 'All Months' : `Specific Month: ${payMonth}`,
        uniqueEmployees: [...new Set(formattedPayrolls.map(p => p.employeeId))].length,
        uniqueMonths: [...new Set(formattedPayrolls.map(p => p.paymentMonth))].length
      },
      data: formattedPayrolls
    };
    
    // Optional: Add aggregated totals if requested
    if (req.body.includeAggregates === true) {
      response.aggregates = {
        totalBasicSalary: formattedPayrolls.reduce((sum, p) => sum + p.basicSalary, 0),
        totalAllowances: formattedPayrolls.reduce((sum, p) => sum + p.totalAllowances, 0),
        totalDeductions: formattedPayrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
        totalNetSalary: formattedPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
      };
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in getReport:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Alternative: More granular control with separate helper functions
const getReportWithAdvancedFilters = async (req, res) => {
  try {
    const { 
      employeeId, 
      payMonth, 
      startMonth, 
      endMonth, 
      minSalary, 
      maxSalary,
      includeDetails 
    } = req.body;
    
    let query = {};
    
    // Build query based on conditions
    
    // Employee filter condition
    if (employeeId && employeeId.trim() !== '' && employeeId !== 'all') {
      query.employee = employeeId;
    }
    
    // Month filter condition
    if (payMonth && payMonth.trim() !== '' && payMonth !== 'all') {
      query.payMonth = payMonth;
    }
    
    // Month range filter condition
    if (startMonth && endMonth) {
      query.payMonth = {
        $gte: startMonth,
        $lte: endMonth
      };
    }
    
    // Fetch payrolls
    let payrolls = await Payroll.find(query)
      .populate('employee')
      .sort({ paymentDate: -1 });
    
    if (!payrolls.length) {
      return res.status(404).json({
        success: false,
        message: 'No records found',
        query: query
      });
    }
    
    // Format data based on includeDetails flag
    let formattedPayrolls;
    
    if (includeDetails === false) {
      // Simplified response (just basic info)
      formattedPayrolls = payrolls.map(p => ({
        employeeName: p.employee.name,
        paymentMonth: p.payMonth,
        totalSalary: p.totalSalary
      }));
    } else {
      // Full detailed response
      formattedPayrolls = await Promise.all(
        payrolls.map(async (payroll) => {
          return await formatPayrollData(payroll, payroll.employee);
        })
      );
    }
    
    // Apply salary range filter
    if (minSalary || maxSalary) {
      formattedPayrolls = formattedPayrolls.filter(p => {
        if (minSalary && p.totalSalary < minSalary) return false;
        if (maxSalary && p.totalSalary > maxSalary) return false;
        return true;
      });
    }
    
    res.status(200).json({
      success: true,
      count: formattedPayrolls.length,
      data: formattedPayrolls
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Export the main function
module.exports = {
  getReport,
  getReportWithAdvancedFilters
};