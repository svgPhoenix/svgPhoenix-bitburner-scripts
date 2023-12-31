import { NS } from '@ns';

export async function main(ns: NS) {
  // IDEAs for startup
  // make or buy hacking programs
  // manage factions

  let player = ns.getPlayer();
  if (player.skills.hacking < 50) {
    ns.singularity.universityCourse('Rothman University', 'Algorithms', false);
    while (player.skills.hacking < 50) {
      player = ns.getPlayer();
      await ns.sleep(1000);
    }
    ns.singularity.stopAction();
  } else ns.exec('blackMarket.js', 'home');
  await ns.sleep(50);
  ns.exec('scriptHostPurchaseWorker.js', 'home', { preventDuplicates: true });
  if (ns.singularity.getCrimeChance('Mug') < 0.9) ns.exec('autoCrime.js', 'home');
}
