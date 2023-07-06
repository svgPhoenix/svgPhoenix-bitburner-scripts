import {NS} from "@ns";
/** @param {NS} ns */
export async function main(ns:NS) {
    ns.tail();
    test(ns, 0);
}

function test(ns:NS, a:number){
    ns.print(a);
    test(ns, ++a);
}