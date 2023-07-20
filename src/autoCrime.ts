import { CrimeType, NS } from '@ns';

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
  // const crimes = [
  //   'Shoplift',
  //   'Rob Store',
  //   'Mug',
  //   'Larceny',
  //   'Deal Drugs',
  //   'Bond Forgery',
  //   'Traffick Arms',
  //   'Homicide',
  //   'Grand Theft Auto',
  //   'Kidnap',
  //   'Assassination',
  //   'Heist'
  // ];
  // let bestReturn = 0,
  //   bestCrime = '';
  // for (const crime of crimes) {
  //   const crimeStats = ns.singularity.getCrimeStats(crime as CrimeType),
  //     currentReturn = (crimeStats.money / crimeStats.time) * ns.singularity.getCrimeChance(crime as CrimeType);
  //   if (bestReturn < currentReturn) {
  //     bestReturn = currentReturn;
  //     bestCrime = crime;
  //   }
  // }
  // ns.singularity.commitCrime(bestCrime as CrimeType, false);
  // while (ns.singularity.getCrimeChance('Traffick Arms') < 0.6) {
  //   await ns.asleep(5000);
  // }
  // ns.singularity.commitCrime('Traffick Arms', false);
}
