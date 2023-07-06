import { findServers } from "./phoenixLib";

/**@param {NS} ns */
export function main(ns) {
	ns.disableLog("scan");
	ns.clearLog();
	ns.tail();
	let hosts = findServers(ns, ["home"], [], false);
	for (let h = 0; h < hosts.length; h++) {
		let contracts = ns.ls(hosts[h], ".cct");
		if (contracts.length > 0) { ns.print("\n" + hosts[h] + ":\n" + contracts.toString() + "\n"); }
		for (let c = 0; c < contracts.length; c++) {
			let contractType = ns.codingcontract.getContractType(contracts[c], hosts[h]);
			let data = ns.codingcontract.getData(contracts[c], hosts[h]);
			switch (contractType) {
				case ("Compression III: LZ Compression"): {
					let ans = compressionIII(data);
					ns.print(ns.codingcontract.attempt(ans, contracts[c], hosts[h]));
				}
				case ("Compression II: LZ Decompression"): {
					let ans = compressionII(data);
					ns.print(ns.codingcontract.attempt(ans, contracts[c], hosts[h]));
				}
				case ("Algorithmic Stock Trader I"): {
					let ans = algorithmicStocksI(data);
					ns.print(ns.codingcontract.attempt(ans, contracts[c], hosts[h]));
				}
				case ("Encryption I: Caesar Cipher"): {
					let ans = encryptionI(data);
					ns.print(ns.codingcontract.attempt(ans, contracts[c], hosts[h]));
				}
				case ("Compression I: RLE Compression"): {
					let ans = compressionI(data);
					ns.print(ns.codingcontract.attempt(ans, contracts[c], hosts[h]));
				}
				default: {
					ns.print("unsolved contract type: " + contractType);
				}
			}
		}
	}

}

function compressionIII(plain) {
	// for state[i][j]:
	//      if i is 0, we're adding a literal of length j
	//      else, we're adding a backreference of offset i and length j
	let cur_state = Array.from(Array(10), () => Array(10).fill(null));
	let new_state = Array.from(Array(10), () => Array(10));

	function set(state, i, j, str) {
		const current = state[i][j];
		if (current == null || str.length < current.length) {
			state[i][j] = str;
		} else if (str.length === current.length && Math.random() < 0.5) {
			// if two strings are the same length, pick randomly so that
			// we generate more possible inputs to Compression II
			state[i][j] = str;
		}
	}

	// initial state is a literal of length 1
	cur_state[0][1] = "";

	for (let i = 1; i < plain.length; ++i) {
		for (const row of new_state) {
			row.fill(null);
		}
		const c = plain[i];

		// handle literals
		for (let length = 1; length <= 9; ++length) {
			const string = cur_state[0][length];
			if (string == null) {
				continue;
			}

			if (length < 9) {
				// extend current literal
				set(new_state, 0, length + 1, string);
			} else {
				// start new literal
				set(new_state, 0, 1, string + "9" + plain.substring(i - 9, i) + "0");
			}

			for (let offset = 1; offset <= Math.min(9, i); ++offset) {
				if (plain[i - offset] === c) {
					// start new backreference
					set(new_state, offset, 1, string + String(length) + plain.substring(i - length, i));
				}
			}
		}

		// handle backreferences
		for (let offset = 1; offset <= 9; ++offset) {
			for (let length = 1; length <= 9; ++length) {
				const string = cur_state[offset][length];
				if (string == null) {
					continue;
				}

				if (plain[i - offset] === c) {
					if (length < 9) {
						// extend current backreference
						set(new_state, offset, length + 1, string);
					} else {
						// start new backreference
						set(new_state, offset, 1, string + "9" + String(offset) + "0");
					}
				}

				// start new literal
				set(new_state, 0, 1, string + String(length) + String(offset));

				// end current backreference and start new backreference
				for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
					if (plain[i - new_offset] === c) {
						set(new_state, new_offset, 1, string + String(length) + String(offset) + "0");
					}
				}
			}
		}

		const tmp_state = new_state;
		new_state = cur_state;
		cur_state = tmp_state;
	}

	let result = null;

	for (let len = 1; len <= 9; ++len) {
		let string = cur_state[0][len];
		if (string == null) {
			continue;
		}

		string += String(len) + plain.substring(plain.length - len, plain.length);
		if (result == null || string.length < result.length) {
			result = string;
		} else if (string.length == result.length && Math.random() < 0.5) {
			result = string;
		}
	}

	for (let offset = 1; offset <= 9; ++offset) {
		for (let len = 1; len <= 9; ++len) {
			let string = cur_state[offset][len];
			if (string == null) {
				continue;
			}

			string += String(len) + "" + String(offset);
			if (result == null || string.length < result.length) {
				result = string;
			} else if (string.length == result.length && Math.random() < 0.5) {
				result = string;
			}
		}
	}

	return result ?? "";
}

function compressionII(compressed) {
	let decompressed = "";
	//true = "type A"
	let chunkType = true;
	//begin iterating through all characters in 'compressed'
	for (let j = 0; j < compressed.length;) {
		let chunkLength = Number.parseInt(compressed.charAt(j));
		//handle zero length chunks
		if (chunkLength == 0) {
			chunkType = !chunkType;
			j++;
			//"type A" chunk
		} else if (chunkType) {
			let k = j + 1;
			for (k; k <= j + chunkLength;) {
				decompressed += compressed.charAt(k);
				k++;
			}
			j = k;
			chunkType = !chunkType;
			//"type B" chunk
		} else {
			let copyDelta = Number.parseInt(compressed.charAt(j + 1));
			for (let k = 0; k < chunkLength; k++) {
				decompressed += decompressed.charAt(decompressed.length - copyDelta);
			}
			j += 2;
			chunkType = !chunkType;
		}
	}
	return decompressed;
}

function algorithmicStocksI(prices) {
	let maxCur = 0;
	let maxSoFar = 0;
	for (let i = 1; i < prices.length; ++i) {
		maxCur = Math.max(0, (maxCur += prices[i] - prices[i - 1]));
		maxSoFar = Math.max(maxCur, maxSoFar);
	}

	return maxSoFar.toString();
}

function algorithmicStocksII(prices){
	
}

function algorithmicStocksIV(data) {
	let trades = data[0];
	let prices = data[1];

}

function encryptionI(data) {
	let List = [
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"ZABCDEFGHIJKLMNOPQRSTUVWXY",
		"YZABCDEFGHIJKLMNOPQRSTUVWX",
		"XYZABCDEFGHIJKLMNOPQRSTUVW",
		"WXYZABCDEFGHIJKLMNOPQRSTUV",
		"VWXYZABCDEFGHIJKLMNOPQRSTU",
		"UVWXYZABCDEFGHIJKLMNOPQRST",
		"TUVWXYZABCDEFGHIJKLMNOPQRS",
		"STUVWXYZABCDEFGHIJKLMNOPQR",
		"RSTUVWXYZABCDEFGHIJKLMNOPQ",
		"QRSTUVWXYZABCDEFGHIJKLMNOP",
		"PQRSTUVWXYZABCDEFGHIJKLMNO",
		"OPQRSTUVWXYZABCDEFGHIJKLMN",
		"NOPQRSTUVWXYZABCDEFGHIJKLM",
		"MNOPQRSTUVWXYZABCDEFGHIJKL",
		"LMNOPQRSTUVWXYZABCDEFGHIJK",
		"KLMNOPQRSTUVWXYZABCDEFGHIJ",
		"JKLMNOPQRSTUVWXYZABCDEFGHI",
		"IJKLMNOPQRSTUVWXYZABCDEFGH",
		"HIJKLMNOPQRSTUVWXYZABCDEFG",
		"GHIJKLMNOPQRSTUVWXYZABCDEF",
		"FGHIJKLMNOPQRSTUVWXYZABCDE",
		"EFGHIJKLMNOPQRSTUVWXYZABCD",
		"DEFGHIJKLMNOPQRSTUVWXYZABC",
		"CDEFGHIJKLMNOPQRSTUVWXYZAB",
		"BCDEFGHIJKLMNOPQRSTUVWXYZA"
	]
	let code = data[0];
	let shift = data[1];

	let output = "";
	for (var i = 0; i < code.length; i++) {
		//ns.tprint(code[i]) CHECKS WE ARE ITERATING PROPERLY THROUGH CODE
		if (code[i] == ' ') {
			output += code[i];
		}
		for (var j = 0, flag = false; j < 26 && flag != true; j++) {
			if (code[i] == List[0][j]) { //IF CODE'S ITH ITEM IS THE LETTER IN THE JTH POSITION
				output += List[shift][j];//GIVE OUTPUT'S ITH ITEM AS THE ENCRYPTED LETTER IN THE JTH POSITION
				flag = true;//SET FLAG THAT WE HAVE DONE ENCRYPTION ON THIS CHARACTER
				//ns.tprint("Match Found") CHECKS WE ARE ITERATING PROPERLY INTO THIS IF SECTION
			}
		}
	}
	return (output);
}

function compressionI(data) {
	var runChar = data.charAt(0);
	var runLen = 1;
	var compressed = "";
	for (let i = 1; i < data.length; i++) {
		if (data.charAt(i) == runChar && runLen < 9) {
			runLen++;
			continue;
		} else {
			compressed += runLen;
			compressed += runChar;
			runChar = data.charAt(i);
			runLen = 1;
		}
	}
	compressed += runLen;
	compressed += runChar;
	return compressed;
}