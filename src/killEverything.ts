import { findServers } from './phoenixLib';
import { NS } from '@ns';
export async function main(ns: NS) {
  const hosts = findServers(ns, ['home'], [], false, false);
  for (let host of hosts) {
    ns.killall(host, true);
  }
}
