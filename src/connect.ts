import { NS } from "@ns";
import { execFromTerminal } from "./phoenixLib";

export async function main(ns: NS) {
    if (typeof ns.args[0] != "string") {
        ns.tprint("TODO: usage");
        return;
    }
    const target = ns.args[0];
    const path = foo(ns, ns.getHostname(), target, [], []);
    if (path.includes(target)) {
        const pathString = ("connect " + path.join("; connect "));
        execFromTerminal(pathString);
        //ns.tprint("full path copied to your clipboard.");
        //setClipboard(pathString);
    } else {
        ns.tprint("could not find path to " + target);
    }
}

//TODO CPU: return [path, found] instead of checking path.includes constantly
//TODO RAM: prepend to path on the way up from the target instead of building and passing args
function foo(ns: NS, hostname: string, target: string, path: string[], visited: string[]) {
    visited.push(hostname);
    const neighbors = ns.scan(hostname);
    if (neighbors.includes(target)) { return path.concat([hostname, target]); }
    for (let neighbor of neighbors) {
        if (visited.includes(neighbor)) { continue; }
        path = foo(ns, neighbor, target, path.concat([hostname]), visited);
        if (path.includes(target)) { return path; }
        path.pop();
    }
    return path;
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
