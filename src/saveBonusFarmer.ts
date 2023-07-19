//IDEA wait for devs to add onClick() hook to toast messages

import { NS } from '@ns';

export async function main(ns: NS) {
  ns.singularity.exportGameBonus();
  ns.singularity.exportGame();
}
