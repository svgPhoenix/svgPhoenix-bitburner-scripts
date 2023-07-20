import { NS } from '@ns';
import { factionNamesAutofill } from './phoenixLib';

export async function main(ns: NS) {
  const facName = ns.args[0].toString();
  if (ns.singularity.checkFactionInvitations().includes(facName)) ns.singularity.joinFaction(facName);
  else ns.tprint('You do not have an invitation from ' + facName);
}

export function autocomplete(data: any, args: any) {
  return factionNamesAutofill;
}
