import { NS } from '@ns';
import { portNames } from './phoenixLib';
//IDEA unify UI for all constant scripts into one dashboard

/* 
UI concept
targeting {hostname} for {timeUntilRescan}(countdown)
{action} + 'ing for' + {actionTime}(countdown)
with {threads} 
<stat/goal display>||<expected hack profit>

operational concept
botnet publishes its actions to the port.
_ui sees an update on the port and peeks the data
botnet waits for operationMillis while _ui displays a countdown
_ui finishes the countdown msOfDelay before botnet finishes sleeping
repeat

*/
export async function main(ns: NS) {
  ns.tail();
  await ns.asleep(0); // wait for a UI update so that the tail window gets moved properly
  ns.setTitle('Botnet');
  ns.resizeTail(340, 435);
  ns.moveTail(1860, 1);
  const portNum = portNames.ui_botnet,
    portHandle = ns.getPortHandle(portNum);
  while (true) {
    await portHandle.nextWrite();
    const _data = ns.peek(portNum);
  }
}
