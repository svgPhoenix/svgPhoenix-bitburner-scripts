import { multiScriptKill } from './phoenixLib';
import { NS } from '@ns';

export async function main(ns: NS) {
  // IDEAs for startup
  // make or buy hacking programs
  // manage factions

  const toKill = ['weaken.js', 'grow.js', 'hack.js', 'botnet.js'];
  let player = ns.getPlayer();
  multiScriptKill(ns, toKill, 'home');
  ns.exec('botnet.js', 'home', 1, '--ui');
  ns.exec('contractServerPurchaseWorker.js', 'home');
  while (player.skills.hacking < 50) {
    ns.singularity.universityCourse('Rothman University', 'Algorithms', false);
    await ns.sleep(1000);
  }
  if (player.skills.strength < 10) ns.exec('autoCrime.js', 'home');
}
