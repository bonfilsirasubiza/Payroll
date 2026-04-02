export const getEmployeeRefId = (employeeRef) => {
  if (!employeeRef) return '';
  return typeof employeeRef === 'object' ? employeeRef._id || '' : employeeRef;
};

export const getEmployeeRefName = (employeeRef, employees = []) => {
  const employeeId = getEmployeeRefId(employeeRef);

  if (employeeRef && typeof employeeRef === 'object') {
    return (
      employeeRef.name ||
      employeeRef.fullName ||
      employees.find((employee) => employee._id === employeeId)?.name ||
      'Unknown Employee'
    );
  }

  return employees.find((employee) => employee._id === employeeId)?.name || 'Unknown Employee';
};
