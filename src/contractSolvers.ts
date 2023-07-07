export function compressionII(compressed:string) {
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

export function algorithmicStocksI(prices:number[]) {
	let maxCur = 0;
	let maxSoFar = 0;
	for (let i = 1; i < prices.length; ++i) {
		maxCur = Math.max(0, (maxCur += prices[i] - prices[i - 1]));
		maxSoFar = Math.max(maxCur, maxSoFar);
	}

	return maxSoFar.toString();
}

//TODO this is Gryphon's algorithm
export function encryptionI(data:[string, number]) {
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

export function compressionI(data:string) {
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