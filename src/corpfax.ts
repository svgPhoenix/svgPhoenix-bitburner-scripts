import { JobName, NS } from '@ns';

export async function main(ns: NS) {
  ns.disableLog('sleep');
  var factioncorps = [
    'Bachman & Associates',
    'ECorp',
    'MegaCorp',
    'KuaiGong International',
    'Four Sigma',
    'NWO',
    'Blade Industries',
    'OmniTek Incorporated',
    'Clarke Incorporated',
    'Fulcrum Technologies'
  ];
  for (var i = 0; i < factioncorps.length; i++) {
    if (
      (!ns.singularity.checkFactionInvitations().includes(factioncorps[i]) && //we aren't invited to the faction already
        !ns.getPlayer().factions.includes(factioncorps[i])) || //we aren't IN the faction already
      (factioncorps[i] == 'Fulcrum Technologies' && //Company IS Fulcrum Tech
        //AND
        (!!ns.singularity.checkFactionInvitations().includes('Fulcrum Secret Technologies') || //we are not invited
          !ns.getPlayer().factions.includes('Fulcrum Secret Technologies'))) //or part of FST
    ) {
      //special jointed case for Fulcrum, whose faction doesn't match the company name

      if (ns.singularity.applyToCompany(factioncorps[i], 'IT')) {
        ns.singularity.workForCompany(factioncorps[i], false);

        while (ns.singularity.getCompanyRep(factioncorps[i]) < 7000) {
          await ns.sleep(1000);
        }
      }

      let requiredCha = ns.singularity.getCompanyPositionInfo(factioncorps[i], JobName.IT1).requiredSkills.charisma;
      if (requiredCha > ns.getPlayer().skills.charisma) {
        ns.singularity.universityCourse('Rothman University', 'Leadership', false);
      }
      do {
        await ns.sleep(1000);
      } while (requiredCha > ns.getPlayer().skills.charisma);

      if (ns.singularity.applyToCompany(factioncorps[i], 'IT')) {
        //if we can get the tier 2 job

        while (ns.singularity.getCompanyRep(factioncorps[i]) < 35000) {
          await ns.sleep(1000);
        }
      }

      requiredCha = ns.singularity.getCompanyPositionInfo(factioncorps[i], JobName.IT2).requiredSkills.charisma;
      if (requiredCha > ns.getPlayer().skills.charisma) {
        ns.singularity.universityCourse('Rothman University', 'Leadership', false);
      }
      do {
        await ns.sleep(1000);
      } while (requiredCha > ns.getPlayer().skills.charisma);

      ns.singularity.applyToCompany(factioncorps[i], 'IT');
      if (ns.singularity.getCompanyFavor(factioncorps[i]) > 50) {
        //only push for a faction invite at 50 favor or better
        let factionname = factioncorps[i];
        if (factionname == 'Fulcrum Technologies') factionname = 'Fulcrum Secret Technologies';
        while (
          !ns.singularity.checkFactionInvitations().includes(factionname) ||
          !ns.getPlayer().factions.includes(factionname)
        ) {
          await ns.sleep(100000);
          ns.singularity.applyToCompany(factioncorps[i], 'IT');
        }
        ns.singularity.joinFaction(factionname);
      }
    }
  }
  ns.singularity.stopAction();

  ns.spawn('facjoin.js');
}
