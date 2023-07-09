import { NS } from "@ns";

export async function main(ns: NS) {
    if (typeof ns.args[0] != "string") {
        ns.tprint("hostname must be a string");
        return;
    }
    if (!ns.serverExists(ns.args[0])) {
        ns.tprint(ns.args[0] + " is not a server");
        return;
    }
    ns.singularity.connect(ns.args[0]);
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
