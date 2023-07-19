import { NS } from '@ns';

export async function main(ns: NS) {
  while (ns.singularity.getCrimeChance('Mug') < 0.9) {
    ns.singularity.gymWorkout('powerhouse gym', 'Str', false);
    await ns.asleep(1000);
    ns.singularity.gymWorkout('powerhouse gym', 'Def', false);
    await ns.asleep(1000);
    ns.singularity.gymWorkout('powerhouse gym', 'Dex', false);
    await ns.asleep(1000);
    ns.singularity.gymWorkout('powerhouse gym', 'Agi', false);
    await ns.asleep(1000);
  }
  ns.singularity.commitCrime('Mug', false);
  // while (ns.singularity.getCrimeChance('Traffick Arms') < 0.6) {
  //   await ns.asleep(5000);
  // }
  // ns.singularity.commitCrime('Traffick Arms', false);
}
