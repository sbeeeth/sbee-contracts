import axios from 'axios';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';

dotenv.config();

interface Repository {
  name: string;
  owner: string;
  stars: string;
}

interface Contributor {
  login: string;
  id: number;
  contributions: number;
}

const githubToken = process.env.GITHUB_TOKEN;
const headers = {
  Authorization: `token ${githubToken}`,
};

async function getRepositories(): Promise<Repository[]> {
  let repos: Repository[] = [];

  let cursor: string | null = null;
  let lastStars = '';
  let repeat = 1;

  let query = `
        query GetRepositories($cursor: String) {
          search(query: "stars:>0", type: REPOSITORY, first: 100, after: $cursor) {
            edges {
              node {
                ... on Repository {
                name
                owner {
                  login
                }
                stargazers {
                  totalCount
                }
                watchers{
                  totalCount
                }
                forkCount
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;
  do {
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query, variables: { cursor } },
      {
        headers,
      },
    );

    if (response.data.errors) {
      break;
    }

    const data = response.data.data.search;

    cursor = data.pageInfo.endCursor;
    repos = repos.concat(
      data.edges.map((edge) => ({
        name: edge.node.name,
        owner: edge.node.owner.login,
        stars: edge.node.stargazers.totalCount,
      })),
    );

    if (cursor == null) {
      if (lastStars == repos[repos.length - 1].stars) {
        repeat += 1;
      } else {
        lastStars = repos[repos.length - 1].stars;
        repeat = 1;
      }

      let startMin = parseInt(lastStars) - repeat * 1000;
      if (startMin < 0 && repeat > 1) {
        break;
      } else if (startMin < 0) {
        startMin = 0;
      }

      const starsCondition = `${startMin}..${parseInt(lastStars)}`;
      query = `
            query GetRepositories($cursor: String) {
              search(query: "stars:${starsCondition}", type: REPOSITORY, first: 100, after: $cursor) {
                edges {
                  node {
                    ... on Repository {
                    name
                    owner {
                      login
                    }
                    stargazers {
                      totalCount
                    }
                    watchers{
                      totalCount
                    }
                    forkCount
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        `;
    }
  } while (repos.length < 5100);

  return repos.slice(0, 5000);
}

async function getContributorsForRepo(owner, name): Promise<Contributor[]> {
  let contributors: Contributor[] = [];
  let page = 1;

  while (true) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${name}/contributors?per_page=100&page=${page}`,
        { headers },
      );

      if (response.data.length === 0) {
        break;
      }

      contributors = contributors.concat(
        response.data.map((contributor) => ({
          id: contributor.id,
          login: contributor.login,
          contributors: contributor.contributions,
        })),
      );
      page++;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 403
      ) {
        console.error(
          'Rate limit reached. You might need to wait and retry later.',
        );
      } else {
        console.error(
          `Error fetching contributors for repo ${owner}/${name}:`,
          error,
        );
      }
      break;
    }
  }

  return contributors;
}

async function getAllContributors() {
  try {
    const repos = await getRepositories();

    let contributorList: Contributor[] = [];
    for (const repo of repos) {
      const contributors = await getContributorsForRepo(repo.owner, repo.name);
      contributorList = contributorList.concat(contributors);
    }

    const outputFile = path.resolve(__dirname, './github-contributors.json');
    await fs.writeFile(outputFile, JSON.stringify(contributorList, null, 2));
  } catch (error) {
    console.error(error);
  }
}

getAllContributors();
