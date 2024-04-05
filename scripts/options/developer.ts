import * as fs from 'fs';

import { BigQuery } from '@google-cloud/bigquery';
import * as util from 'util';

const bigquery = new BigQuery({
  projectId: 'your-project-id', // replace with your project id
  credentials: {
    client_email: 'your-client-id', // replace with your client id
    private_key: 'your-private-key', // replace with your private key
  },
});

async function executePagedQuery(limit: number, offset: number): Promise<any> {
  const query = `
      SELECT from_address, receipt_contract_address, \`hash\`, block_number
      FROM \`bigquery-public-data.crypto_ethereum.transactions\`
      WHERE to_address is null
      LIMIT ${limit}
      OFFSET ${offset}
    `;

  const options = {
    query: query,
    location: 'US',
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const result = await job.getQueryResults();
    const [rows] = result;
    return rows;
  } catch (error) {
    throw new Error('Error executing BigQuery query');
  }
}

const writeFile = util.promisify(fs.writeFile);

async function get(): Promise<void> {
  const limit = 10; // define your limit
  const target = 10; // define the total amount of data you want to fetch
  let total = 0;
  const map = {};
  const csvData = ['address,receipt_contract_address,hash,block_number'];

  for (;;) {
    const items = await executePagedQuery(limit, total);

    if (items.length > 0) {
      const entities = [];
      for (const item of items) {
        item.from_address = item.from_address.toLocaleLowerCase();
        item.receipt_contract_address =
          item.receipt_contract_address.toLocaleLowerCase();
        const developerEntity = {
          address: item.from_address,
          receipt_contract_address: item.receipt_contract_address,
          hash: item.hash,
          block_number: item.block_number,
        };

        const key = item.from_address + item.receipt_contract_address;
        if (map[key]) {
          continue;
        }

        map[key] = 1;
        entities.push(developerEntity);

        const csvRow = `${developerEntity.address},${developerEntity.receipt_contract_address},${developerEntity.hash},${developerEntity.block_number}`;
        csvData.push(csvRow);
      }
    } else {
      break;
    }

    total = total + items.length;
    if (total >= target) {
      console.log('Reached target', total);
      break;
    }
  }

  const csvContent = csvData.join('\n');
  await writeFile('output.csv', csvContent, 'utf8');
}

async function main() {
  try {
    await get();
    console.log('CSV file created successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
