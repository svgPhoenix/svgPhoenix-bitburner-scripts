import { findServers } from './phoenixLib';
import * as solvers from './contractSolvers';
import { NS } from '@ns';

export function main(ns: NS) {
  ns.disableLog('scan');
  ns.disableLog('codingcontract.attempt');
  ns.clearLog();
  ns.tail();
  let hosts = findServers(ns, ['home'], [], false),
    rewards: string[] = [],
    allContracts: ContractDirectory = {},
    contractType: string,
    data: any;
  for (let host of hosts) {
    let contractFiles = ns.ls(host, '.cct');
    allContracts[host] = [];
    for (let contractFile of contractFiles) {
      (contractType = ns.codingcontract.getContractType(contractFile, host)),
        (data = ns.codingcontract.getData(contractFile, host));
      switch (contractType) {
        case 'Compression II: LZ Decompression':
          handleAttempt(solvers.compressionII, data, contractFile, host);
        case 'Algorithmic Stock Trader I':
          handleAttempt(solvers.algorithmicStocksI, data, contractFile, host);
        case 'Encryption I: Caesar Cipher':
          handleAttempt(solvers.encryptionI, data, contractFile, host);
        case 'Compression I: RLE Compression':
          handleAttempt(solvers.compressionI, data, contractFile, host);
        default: {
          allContracts[host].push('\n' + contractFile + ': ' + contractType);
        }
      }
    }
  }
  // print list of unsolved contracts
  for (let server in allContracts) {
    if (allContracts[server].length > 0) {
      ns.print('\n' + server + ': ' + allContracts[server]);
    }
  }
  if (rewards.length > 0) {
    ns.print('\nReward summary:\n' + rewards.join('\n'));
  }

  function handleAttempt(solver: Function, data: string, contractFile: string, host: string) {
    ns.print('attempting ' + contractType + ' with data: ' + data);
    const ans = solver(data);
    rewards.push(ns.codingcontract.attempt(ans, contractFile, host));
  }
}

interface ContractDirectory {
  [index: string]: string[];
}
