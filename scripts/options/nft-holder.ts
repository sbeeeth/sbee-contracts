import axios from 'axios';
import * as fs from 'fs';

import * as util from 'util';

const MNEMONIC_HQ_API_KEY = 'your-api-key'; // replace with your mnemonic hq api key
const MNEMONIC_HQ_API_OWNER_URL =
  'https://ethereum-rest.api.mnemonichq.com/collections/v1beta2/%s/owners_list';
const MNEMONIC_HQ_API_COUNT_URL =
  'https://ethereum-rest.api.mnemonichq.com/collections/v1beta2/%s/owners_count/DURATION_1_DAY/GROUP_BY_PERIOD_1_HOUR?timestampLt=';

const writeFile = util.promisify(fs.writeFile);

interface Contract {
  name: string;
  address: string;
}

async function getOwnersList(
  contractAddress: string,
  limit: number,
  offset: number,
): Promise<any> {
  const url =
    MNEMONIC_HQ_API_OWNER_URL.replace('%s', contractAddress) +
    `?limit=${limit}&offset=${offset}`;

  const apiKey = MNEMONIC_HQ_API_KEY;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': apiKey,
        accept: 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch owners list');
  }
}

async function getOwnersCount(contractAddress: string): Promise<any> {
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const url =
    MNEMONIC_HQ_API_COUNT_URL.replace('%s', contractAddress) +
    endOfDay.toISOString();

  const apiKey = MNEMONIC_HQ_API_KEY;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': apiKey,
        accept: 'application/json',
      },
    });

    if (response.data?.dataPoints?.length > 0) {
      const count =
        response.data.dataPoints[response.data.dataPoints.length - 1].count;
      return Number.parseInt(count, 10);
    }

    return 0;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch owners list');
  }
}

async function getAllOwners(contractAddress: string): Promise<any> {
  let ownersList = [];
  const totalOwnersCount = await getOwnersCount(contractAddress);
  if (totalOwnersCount === 0) {
    return [];
  }

  const limit = 500;
  for (let offset = 0; offset < totalOwnersCount; offset += limit) {
    const partialOwnersList = await getOwnersList(
      contractAddress,
      limit,
      offset,
    );
    ownersList = ownersList.concat(partialOwnersList.owner);
  }

  return ownersList;
}

async function syncNftHolder(): Promise<void> {
  const queryContracts: Contract[] = [
    {
      name: 'Cryptopunks',
      address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    },
    {
      name: 'Mutant Ape Yacht Club',
      address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    },
    {
      name: 'Bored Ape Yacht Club',
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    },
    {
      name: 'Pudgy Penguins',
      address: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
    },
    {
      name: 'Milady Maker',
      address: '0x5af0d9827e0c53e4799bb226655a1de152a425a5',
    },
    {
      name: 'The Memes by Punk6529',
      address: '0x33fd426905f149f8376e227d0c9d3340aad17af1',
    },
    {
      name: 'Mfers',
      address: '0x79fcdef22feed20eddacbb2587640e45491b757f',
    },
    {
      name: 'Sappy Seals',
      address: '0x364c828ee171616a39897688a831c2499ad972ec',
    },
    {
      name: '$SBEE Launch Plan 5',
      address: '0x6339e5e072086621540d0362c4e3cea0d643e114',
    },
    {
      name: 'Azuki',
      address: '0xed5af388653567af2f388e6224dc7c4b3241c544',
    },
    {
      name: 'Cool Cats',
      address: '0x1a92f7381b9f03921564a437210bb9396471050c',
    },
    {
      name: 'Meebits',
      address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
    },
    {
      name: 'DeGods',
      address: '0x892848074ddea461a15f337250da3ce55580ca85',
    },
    {
      name: 'Kanpai Pandas',
      address: '0xacf63e56fd08970b43401492a02f6f38b6635c91',
    },
    {
      name: 'Forgotten Runes Wizards Cult',
      address: '0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42',
    },
    {
      name: 'Sproto Gremlins',
      address: '0xeeca64ea9fcf99a22806cd99b3d29cf6e8d54925',
    },
    {
      name: 'Treeverse Plots',
      address: '0x1b829b926a14634d36625e60165c0770c09d02b2',
    },
    {
      name: 'World of Women',
      address: '0xe785e82358879f061bc3dcac6f0444462d4b5330',
    },
    {
      name: 'Wassies by Wassies',
      address: '0x1d20a51f088492a0f1c57f047a9e30c9ab5c07ea',
    },
    {
      name: 'Checks - VV Edition',
      address: '0x34eebee6942d8def3c125458d1a86e0a897fd6f9',
    },
    {
      name: 'Memeland Captainz',
      address: '0x769272677fab02575e84945f03eca517acc544cc',
    },
    {
      name: '0N1 Force',
      address: '0x3bf2922f4520a8ba0c2efc3d2a1539678dad5e9d',
    },
    {
      name: 'Mavia Land',
      address: '0x4a537f61ef574153664c0dbc8c8f4b900cacbe5d',
    },
    {
      name: 'rektguy',
      address: '0xb852c6b5892256c264cc2c888ea462189154d8d7',
    },
    {
      name: 'Artblocks',
      address: '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a',
    },
    {
      name: 'Women and Weapons',
      address: '0x338866f8ba75bb9d7a00502e11b099a2636c2c18',
    },
  ];

  const entities = [];
  for (const contract of queryContracts) {
    const count = await getOwnersCount(contract.address);
    const owners = await getAllOwners(contract.address);

    if (count > 0 && owners.length > 0) {
      for (const owner of owners) {
        const ownerEntity = {
          contract_address: contract.address.toLowerCase(),
          address: owner.address.toLowerCase(),
          owned: owner.ownedQuantity,
        };

        entities.push(ownerEntity);
      }
    }
  }

  if (entities.length > 0) {
    const csvData = ['contract_address,address,owned'];
    for (const entity of entities) {
      const csvRow = `${entity.contract_address},${entity.address},${entity.owned}`;
      csvData.push(csvRow);
    }
    const csvContent = csvData.join('\n');
    await writeFile('output.csv', csvContent, 'utf8');
  }
}

async function main() {
  try {
    await syncNftHolder();
    console.log('JSON file created successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
