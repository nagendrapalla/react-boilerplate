/**
 * Returns the appropriate dashboard route based on the user's role
 * @param role The user's role
 * @returns The dashboard route path for the given role
 */
export const redirectByRole = (role: string): string => {
  console.log(`Redirecting user with role: ${role}`);
  switch (role) {
    case "ROLE_Instructor":
      return "/training/tutor";
    case "ROLE_Student":
      return "/training/student";
    default:
      return "/training";
  }
};
