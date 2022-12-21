/*
This is part of jsdifflib v1.0. <http://github.com/cemerick/jsdifflib>

Copyright 2007 - 2011 Chas Emerick <cemerick@snowtide.com>. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY Chas Emerick ``AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Chas Emerick OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of Chas Emerick.
*/
var replaced = 0, inserted = 0, deleted = 0, matched = 0;

diffview = {
	/**
	 * Builds and returns a visual diff view.  The single parameter, `params', should contain
	 * the following values:
	 *
	 * - baseTextLines: the array of strings that was used as the base text input to SequenceMatcher
	 * - newTextLines: the array of strings that was used as the new text input to SequenceMatcher
	 * - opcodes: the array of arrays returned by SequenceMatcher.get_opcodes()
	 * - baseTextName: the title to be displayed above the base text listing in the diff view; defaults
	 *	   to "Base Text"
	 * - newTextName: the title to be displayed above the new text listing in the diff view; defaults
	 *	   to "New Text"
	 * - contextSize: the number of lines of context to show around differences; by default, all lines
	 *	   are shown
	 * - viewType: if 0, a side-by-side diff view is generated (default); if 1, an inline diff view is
	 *	   generated
	 */

  
	buildView: function (params) {
		replaced = 0; inserted = 0; deleted = 0; matched = 0;
		var baseTextLines = params.baseTextLines;
		var newTextLines = params.newTextLines;
		var opcodes = params.opcodes;
		var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
		var newTextName = params.newTextName ? params.newTextName : "New Text";
		var contextSize = params.contextSize;
		var inline = (params.viewType == 0 || params.viewType == 1) ? params.viewType : 0;

    let startTimings = [];
    let endTimings = [];
    let durations = [];

    inline = 0;

    // for visual testing, automatically generate plausaible timings
    params.baseTextLines.forEach((word, index) => {
      startTimings.push((index+1)*1000); //[1000, 2000, 3000, 4000, 5000, 6000...]
      endTimings.push(startTimings[index]+500+index+1); //[1501, 2502, 3503, 4504, 5505, 6506...]
      durations.push(endTimings[index]-startTimings[index]); // [501, 502, 503, 504, 505, 506...]
    });

    let boundaryStart = 30;
    let boundaryEnd = endTimings[params.baseTextLines.length-1]+3000;
    console.log(endTimings);
    console.log(params.baseTextLines);
    console.log(boundaryEnd);
    //console.log(startTimings);
    //console.log(endTimings);

    function sanitise(str) {
      let punctuationless = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      let finalString = punctuationless.replace(/\s{2,}/g," ");
      return (finalString.toLowerCase());
      //return (str.replace(/ /g, "\n").replace(/\./g, "").replace(/,/g, "").replace(/’/g, "'").replace(/“/g, "").replace(/’/g, "”").toLowerCase());
    }

    //console.log("baseObject");
    //console.log(params.baseObject);

    if (params.pass === true) {

      baseTextLines = [];
      //document.getElementById('baseText').value = "";

      params.baseObject.forEach(word => {
        baseTextLines.push(sanitise(word.text));
        //console.log(sanitise(word.text));
        //document.getElementById('baseText').value += word.text + " ";
      });
      //document.getElementById('baseText').value = document.getElementById('baseText').value.trim();

      newTextLines = params.newText.split(' ');
    
      newTextLines.forEach((word, index) => {
        newTextLines[index] = sanitise(word);
        //console.log(sanitise(word));
      });

      /*document.getElementById('newText').value = params.newText;*/

      /*console.log(baseTextLines);
      console.log(newTextLines);*/

    } 


    //console.log(">>>>>>>>>>>>inline = "+inline);

    //var inline = 0;

		if (baseTextLines == null)
			throw "Cannot build diff view; baseTextLines is not defined.";
		if (newTextLines == null)
			throw "Cannot build diff view; newTextLines is not defined.";
		if (!opcodes)
			throw "Cannot build diff view; opcodes is not defined.";

		function celt (name, clazz) {
			var e = document.createElement(name);
			e.className = clazz;
			return e;
		}

		function telt (name, text) {
			var e = document.createElement(name);
			e.appendChild(document.createTextNode(text));
			return e;
		}

		function ctelt (name, clazz, text) {
			var e = document.createElement(name);
			e.className = clazz;
			e.appendChild(document.createTextNode(text));
			return e;
		}

		var tdata = document.createElement("thead");
		var node = document.createElement("tr");
		tdata.appendChild(node);
		if (inline) {
			node.appendChild(document.createElement("th"));
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", baseTextName + " vs. " + newTextName));
		} else {
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", baseTextName));
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", newTextName));
		}
		tdata = [tdata];

		var rows = [];
		var node2;

    let dOutput = [];
    let diffOutput = [];
    let diffOutputBase = [];
    let diffOutputNew = [];
    let diffColumn = "base"



		/**
		 * Adds two cells to the given row; if the given row corresponds to a real
		 * line number (based on the line index tidx and the endpoint of the
		 * range in question tend), then the cells will contain the line number
		 * and the line of text from textLines at position tidx (with the class of
		 * the second cell set to the name of the change represented), and tidx + 1 will
		 * be returned.	 Otherwise, tidx is returned, and two empty cells are added
		 * to the given row.
		 */
		function addCells (row, tidx, tend, textLines, change) {
      //let diffObject = null;
      //console.log("===== ADD CELLS =====");

      let wordText = "";
      if (tidx < tend) {
        /*console.log("tidx = "+tidx);
        console.log("tend = "+tend);
        console.log("*******");
        console.log(textLines);*/
        wordText = textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0");
      }
    
      let wordObj = {'tidx':tidx, 'tend':tend, 'text':wordText, 'status':change};

      diffOutput.push(wordObj);
      //console.log(wordObj);

      /*console.log("==================");
      console.log("=== diffOutput ===");
      console.log(diffOutput);*/

      /*console.log("==================");
      console.log("=== diffOutputBase ===");
      console.log(diffOutputBase);

      console.log("tidx = "+tidx);*/
      
      if (params.pass === true) {
        if (diffColumn === "base") {
          if (tidx < params.baseObject.length) {
            wordObj.start = params.baseObject[tidx].start;
            wordObj.end = params.baseObject[tidx].end;
            wordObj.duration = params.baseObject[tidx].end - params.baseObject[tidx].start;
          } else {
            wordObj.start = undefined;
            wordObj.end = undefined;
            wordObj.duration = undefined;
          }
          diffOutputBase.push(wordObj);
          diffColumn = "new";
        } else {
          diffOutputNew.push(wordObj);
          diffColumn = "base";
        }
      } else {
        if (diffColumn === "base") {
          wordObj.start = startTimings[tidx];
          wordObj.end = endTimings[tidx];
          wordObj.duration = durations[tidx];
          diffOutputBase.push(wordObj);
          diffColumn = "new";
        } else {
          diffOutputNew.push(wordObj);
          diffColumn = "base";
        }
      }
      

			if (tidx < tend) {
				row.appendChild(telt("th", (tidx + 1).toString()));
				row.appendChild(ctelt("td", change, textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
        //console.log("first");
				return tidx + 1;
			} else {
				row.appendChild(document.createElement("th"));
				row.appendChild(celt("td", "empty"));
        //console.log("second");
				return tidx;
			}
		}

		function addCellsInline (row, tidx, tidx2, textLines, change) {
      dOutput.push({'row':row, 'tidx':tidx, 'tidx2':tidx2, 'textLines':textLines, 'change':change});
			row.appendChild(telt("th", tidx == null ? "" : (tidx + 1).toString()));
			row.appendChild(telt("th", tidx2 == null ? "" : (tidx2 + 1).toString()));
			row.appendChild(ctelt("td", change, textLines[tidx != null ? tidx : tidx2].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
		}

    //console.log("opcodes = ");
    //console.log(opcodes);

		for (var idx = 0; idx < opcodes.length; idx++) {
			code = opcodes[idx];
			change = code[0];
			var b = code[1];
			var be = code[2];
			var n = code[3];
			var ne = code[4];
			var rowcnt = Math.max(be - b, ne - n);
			var toprows = [];
			var botrows = [];
			for (var i = 0; i < rowcnt; i++) {
				// jump ahead if we've alredy provided leading context or if this is the first range
				if (contextSize && opcodes.length > 1 && ((idx > 0 && i == contextSize) || (idx == 0 && i == 0)) && change=="equal") {
					var jump = rowcnt - ((idx == 0 ? 1 : 2) * contextSize);
					if (jump > 1) {
						toprows.push(node = document.createElement("tr"));

						b += jump;
						n += jump;
						i += jump - 1;
						node.appendChild(telt("th", "..."));
						if (!inline) node.appendChild(ctelt("td", "skip", ""));
						node.appendChild(telt("th", "..."));
						node.appendChild(ctelt("td", "skip", ""));

						// skip last lines if they're all equal
						if (idx + 1 == opcodes.length) {
							break;
						} else {
							continue;
						}
					}
				}



				toprows.push(node = document.createElement("tr"));
				if (inline) {
					if (change == "insert") {
						addCellsInline(node, null, n++, newTextLines, change);
						//console.log('insert');
						inserted++;
					} else if (change == "replace") {
						//console.log('replace');
						replaced++;
						botrows.push(node2 = document.createElement("tr"));
						if (b < be) addCellsInline(node, b++, null, baseTextLines, "delete");
						if (n < ne) addCellsInline(node2, null, n++, newTextLines, "insert");
					} else if (change == "delete") {
						//console.log('delete');
						deleted++;
						addCellsInline(node, b++, null, baseTextLines, change);
					} else {
						// equal
						//console.log('matched');
						matched++;
						addCellsInline(node, b++, n++, baseTextLines, change);
					}
				} else {

					if (change == "replace") replaced++;
					if (change == "insert") inserted++;
					if (change == "delete") deleted++;
					if (change == "equal") matched++;

					b = addCells(node, b, be, baseTextLines, change);
					n = addCells(node, n, ne, newTextLines, change);
				}
			}

			for (var i = 0; i < toprows.length; i++) rows.push(toprows[i]);
			for (var i = 0; i < botrows.length; i++) rows.push(botrows[i]);

      
		}

		rows.push(node = ctelt("th", "author", "diff view generated by "));
		node.setAttribute("colspan", inline ? 3 : 4);
		node.appendChild(node2 = telt("a", "jsdifflib"));
		node2.setAttribute("href", "http://github.com/cemerick/jsdifflib");

		tdata.push(node = document.createElement("tbody"));
		for (var idx in rows) rows.hasOwnProperty(idx) && node.appendChild(rows[idx]);

		node = celt("table", "diff" + (inline ? " inlinediff" : ""));
		for (var idx in tdata) tdata.hasOwnProperty(idx) && node.appendChild(tdata[idx]);

    if (params.pass !== true) {
      document.getElementById('replaced').innerHTML = replaced;
      document.getElementById('inserted').innerHTML = inserted;
      document.getElementById('deleted').innerHTML = deleted;
      document.getElementById('matched').innerHTML = matched;
    }

    let output = [];

    if (inline === 0) {
      rows.forEach((row) => {
        if (row.childNodes.length > 2) {  
          output.push({'bidx':row.childNodes[0].innerText, 'btxt': row.childNodes[1].innerText, 'nidx':row.childNodes[2].innerText, 'ntxt': row.childNodes[3].innerText, 'status': row.lastChild.className});
        }
      });
    }



    let lastStatus = null;
    let totalInserts = 0;
    let realigned = [];

    if (params.pass === true) {
      boundaryStart = params.boundaryStart;
      boundaryEnd = params.boundaryEnd;
    }

    /*console.log("==================");
    console.log("=== diffOutputBase ===");
    console.log(diffOutputBase);*/

    diffOutputBase.forEach((out, index) => {
      
      if (out.status === "equal") {
        realigned.push({'text': out.text, 'start': out.start, 'duration': out.duration, 'end': out.end});
      }

      if (out.status === "replace" && lastStatus !== "replace") {

        let wordLengths = [];
        let totalWordLength = 0;

        // we have two entries for each "row" – the old and the new
        wordLengths[0] = diffOutputNew[index].text.length; 
        totalWordLength += wordLengths[0];

        let startTime = out.start;
        let replacements = 1;
        let replaceGapsBase = 0;
        let replaceGapsNew = 0;
    
        // lookahead, are there any other replacements immediately after, if so - how many?
      
        while(diffOutputBase[index+replacements] != undefined && diffOutputBase[index+replacements].status === "replace") {
          wordLengths[replacements] = diffOutputNew[index+replacements].text.length;
          totalWordLength += wordLengths[replacements];
          // if diffOutputBase replacements include those with blank text we should record that for later
          if (diffOutputBase[index+replacements].text.length === 0) {
            replaceGapsBase++;
          }

          if (wordLengths[replacements] === 0){
            replaceGapsNew++;
          }
          
          replacements++; 
        }

        console.log(wordLengths);
        console.log(replaceGapsNew);

        if (replaceGapsBase === 0 && replaceGapsNew === 0) { // same number or replacements in base as new so maintain timings (ie no gaps in base)
          for (let i = 0; i < replacements; i++) {
            if (diffOutputNew[index+i].text.length > 0){
              realigned.push({'text': diffOutputNew[index+i].text, 'start': diffOutputBase[index+i].start, 'duration': diffOutputBase[index+i].duration, 'end': diffOutputBase[index+i].end});
            }
          }
        } else {
          // check the next non-replacement and grab its time to calculate increments for the replacements
          if (diffOutputBase[index+replacements]) {
            endTime = diffOutputBase[index+replacements].start;
          } else { 
            // check whether the inserts are the last n items are the last items in base
            if (index + replacements + replaceGapsBase === diffOutputBase.length) {
              endTime = diffOutputBase[index+replacements-1].end;
            } else {
              endTime = boundaryEnd;
            }
          }

          let counter = 0;
          let lastEndTime = null;
          
          // check to see if all text is being replaced
          if (replacements === diffOutputBase.length) {
            // special case for all text being replaced
            gap = boundaryEnd - boundaryStart;
            let lastStartTime = boundaryStart;
            let timePerChar = gap/totalWordLength;

            // spread the words according to length within the gap available
            diffOutputNew.forEach((word, index) => {
              let replacementDuration = Math.floor((timePerChar)*wordLengths[index])-1;
              if (word.text.length > 0){
                realigned.push({'text': word.text, 'start': lastStartTime, 'duration': replacementDuration , 'end': lastStartTime + replacementDuration});
                lastStartTime = lastStartTime + replacementDuration + 1;
              }
            });
          }
          else // loop through the replacements again and push the text and new calculated time
          {
            while(diffOutputBase[index+counter] !== undefined && diffOutputBase[index+counter].status === "replace") {

              if (realigned.length > 0) { // a previously aligned word exists
                let lastRealigned = realigned[realigned.length - 1];
                lastEndTime = lastRealigned.start + lastRealigned.duration;
                gap = (endTime - startTime);
              } else { // a previously aligned word does not exist 
                lastEndTime = boundaryStart;
                gap = diffOutputBase[0].start - boundaryStart;
              }

              counter++; 
              let timePerChar = gap/totalWordLength;
              let wordLength = wordLengths[counter-1];
            
              if (counter === 1) { // a counter of 1 means we're at the first replacement which starts from next startTime
                // duration should be that of replaced word when there is only one replacement
                let replacementDuration = out.duration;
                // if there's more than one replacement word we need to calculate
                if (replacements > 1) {
                  replacementDuration = Math.floor((timePerChar)*wordLength)-1;
                }
                console.log(diffOutputNew[index+counter-1].text);
                if (diffOutputNew[index+counter-1].text.length > 0){
                  realigned.push({'text': diffOutputNew[index+counter-1].text, 'start': out.start, 'duration': replacementDuration, 'end': out.start + replacementDuration});
                }
              } else { // subsequent pushes should use lastEndTime + duration
                console.log(diffOutputNew[index+counter-1].text);
                if (diffOutputNew[index+counter-1].text.length > 0){
                  realigned.push({'text': diffOutputNew[index+counter-1].text, 'start': lastEndTime+1, 'duration': Math.floor((timePerChar)*wordLength)-1, 'end':lastEndTime + Math.floor((timePerChar)*wordLength)});
                }
              }
            }
          }
        }
        totalInserts += (replacements - 1);
      }

      if (out.status === "insert" && lastStatus !== "insert") {

        let wordLengths = [];
        let totalWordLength = 0;
        // we have two entries for each "row" – the old and the new
        /*console.log("===========")
        console.log(diffOutputNew[index].text);
        console.log("===========");*/
        wordLengths[0] = diffOutputNew[index].text.length; 
        totalWordLength += wordLengths[0];

        // we need to take account of the total number of inserts that have come before 
        // as the index value includes those

        let startTime = out.start + out.duration;
        
        if (realigned.length > 0) { // previously aligned word exists)
          startTime = diffOutputBase[index-1].start + diffOutputBase[index-1].duration; 
        }
        
        //establish inserts in a row
        let inserts = 1;

        if (index+inserts < diffOutputBase.length - 1){
          // lookahead, are there any other inserts immediately after, if so - how many?
          while(diffOutputBase[index+inserts] != undefined && diffOutputBase[index+inserts].status === "insert") {
            wordLengths[inserts] = diffOutputNew[index+inserts].text.length;
            totalWordLength += wordLengths[inserts];
            inserts++;
          }
        }

        let endTime = null;
        let gap = null;

        // check the next non-insert and grab its time to calculate increments for the inserts
        if (diffOutputBase[index+inserts-1]) {
          endTime = diffOutputBase[index+inserts-1].start;
        }

        let counter = 0;
        let lastEndTime = null;

        // loop through the inserts again and push the text and new calculated time

        /*console.log("index = "+index);
        console.log("counter = "+counter);
        console.log("diffOutputBase.length = "+diffOutputBase.length);*/

        while(diffOutputBase[index+counter].status === "insert" && index+counter < diffOutputBase.length - 1) {
          if (realigned.length > 0) { // previously aligned word exists
            let lastRealigned = realigned[realigned.length - 1];
            lastEndTime = lastRealigned.start + lastRealigned.duration;
            gap = (endTime - startTime);
            //console.log("endTime = "+endTime);
            //console.log("startTime = "+startTime);
          } else { // previously aligned word does not exist 
            lastEndTime = boundaryStart;
            gap = diffOutputBase[0].start - boundaryStart;
          }
          counter++; 
          let timePerChar = gap/totalWordLength;
          /*console.log("totalWordLength = "+totalWordLength);
          console.log("gap = "+gap);
          console.log("timePerChar = "+timePerChar);*/
          let wordLength = wordLengths[counter-1];
          if (endTime !== undefined) {
            realigned.push({'text': diffOutputNew[index+counter-1].text, 'start': lastEndTime+1, 'duration': Math.floor((timePerChar)*wordLength)-2, 'end': lastEndTime + Math.floor((timePerChar)*wordLength)-1});
          }
        }
        console.log("endTime = "+endTime);

        if (endTime === undefined) { // no end time means words were added to the end
          //console.log("EXTRA WORDS!!!!");
          // figure out how many 
          let wordsAddedToEnd = diffOutputBase.length - index;
          /*console.log("wordsAddedToEnd = "+wordsAddedToEnd);

          console.log("index = "+index);
          console.log("diffOutputBase.length = "+diffOutputBase.length);*/

          wordLengths = [];
          totalWordLength = 0;

          for (let idx = 0; idx < wordsAddedToEnd; idx++){
            wordLengths[idx] = diffOutputNew[index+idx].text.length;
            totalWordLength += wordLengths[idx];
          }

          /*console.log("wordLengths = ");
          console.log(wordLengths);
          console.log("totalWordLength = "+totalWordLength);*/

          let lastRealigned = realigned[realigned.length - 1];
          lastEndTime = lastRealigned.start + lastRealigned.duration;

          gap = boundaryEnd - lastEndTime;
          //console.log("gap = "+gap);
          //console.log(wordLengths);
          let timePerChar = gap/totalWordLength;

          wordLengths.forEach((chars,idx) => {
            realigned.push({'text': diffOutputNew[index+idx].text, 'start': lastEndTime+1, 'duration': Math.floor((timePerChar)*chars)-1, 'end': lastEndTime + Math.floor((timePerChar)*chars)});
            lastEndTime = lastEndTime + Math.floor((timePerChar)*chars) - 1;
          });
        }
        totalInserts += inserts;
      }

      lastStatus = out.status;
    });

    console.log("diffOutputBase...");
    console.log(diffOutputBase);

    console.log("diffOutputNew...");
    console.log(diffOutputNew);

    console.log("realigned...");
    console.log(realigned);

    ////console.log(node);

    let returnData = {data: realigned, debug: node};

		return returnData;
	} 
};

// required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { diffview };
}
