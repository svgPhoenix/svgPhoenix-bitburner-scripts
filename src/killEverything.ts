import { findServers } from './phoenixLib';
import { NS } from '@ns';
export async function main(ns: NS) {
  const hosts = findServers(ns);
  for (let host of hosts) {
    ns.killall(host, true);
  }
}
