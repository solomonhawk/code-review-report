import type { Stats } from "~/lib/types";

export function getMostActiveUser(userStats: Record<string, Stats>) {
  let mostActiveUser = "none";
  let mostActiveUserCount = 0;

  for (const [user, stats] of Object.entries(userStats)) {
    if (stats.reviews + stats.opened > mostActiveUserCount) {
      mostActiveUser = user;
      mostActiveUserCount = stats.reviews + stats.opened;
    }
  }

  return [mostActiveUser, mostActiveUserCount] as const;
}

export function getMostActiveProject(projectStats: Record<string, Stats>) {
  let mostActiveProject = "none";
  let mostActiveProjectCount = 0;

  for (const [project, stats] of Object.entries(projectStats)) {
    if (stats.reviews > mostActiveProjectCount) {
      mostActiveProject = project;
      mostActiveProjectCount = stats.reviews;
    }
  }

  return [mostActiveProject, mostActiveProjectCount] as const;
}
