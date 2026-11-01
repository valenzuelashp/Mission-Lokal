export interface PersonnelRoleOption {
    value: string;
    label: string;
}

function normalizeDepartmentName(department: string): string {
    return department.trim().toLocaleLowerCase();
}

export function getPersonnelRolesForDepartment(
    department: string,
    rolesByDepartment: Record<string, PersonnelRoleOption[]>,
): PersonnelRoleOption[] {
    const normalizedDepartment = normalizeDepartmentName(department);
    const savedRoles = Object.entries(rolesByDepartment)
        .filter(([name]) => normalizeDepartmentName(name) === normalizedDepartment)
        .flatMap(([, roles]) => roles);
    const rolesByValue = new Map<string, PersonnelRoleOption>();

    savedRoles.forEach((role) => {
        const key = role.value.trim().toLocaleLowerCase();
        if (key && !rolesByValue.has(key)) {
            rolesByValue.set(key, role);
        }
    });

    return Array.from(rolesByValue.values()).sort((left, right) => left.label.localeCompare(right.label));
}
