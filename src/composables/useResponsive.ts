import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

/**
 * Breakpoints compartidos — mismos valores que Tailwind (sm/md/lg/xl/2xl)
 * para que la lógica de layout en JS nunca se desincronice de las clases
 * responsive usadas en las plantillas.
 */
export function useResponsive() {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const isMobile = breakpoints.smaller("sm");
  const isTablet = breakpoints.between("sm", "lg");
  const isDesktop = breakpoints.greaterOrEqual("lg");

  return { breakpoints, isMobile, isTablet, isDesktop };
}
