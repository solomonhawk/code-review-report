import { ContributorStats } from "~/lib/api/types";

export const contributorStatsFixture = {
  solomonhawk: {
    username: "solomonhawk",
    opened: {
      total_count: 1,
      items: [
        {
          repository_url: "https://api.github.com/repos/solomonhawk/effect",
          title: "Add GitHub API layer",
          user: {
            login: "solomonhawk",
          },
        },
      ],
    },
    merged: {
      total_count: 1,
      items: [
        {
          repository_url: "https://api.github.com/repos/solomonhawk/effect",
          title: "Add GitHub API layer",
          user: {
            login: "solomonhawk",
          },
        },
      ],
    },
    reviews: {
      total_count: 1,
      items: [
        {
          repository_url: "https://api.github.com/repos/solomonhawk/effect",
          title: "Add GitHub API layer",
          user: {
            login: "solomonhawk",
          },
        },
      ],
    },
  },
} as const satisfies Record<string, ContributorStats>;
