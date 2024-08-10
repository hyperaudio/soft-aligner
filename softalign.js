softalign = {
  alignTranscript: function(baseObj, newTxt) {
      const words = newTxt.toLowerCase().split(/\s+/);
      const result = [];
      let baseIndex = 0;
    
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        if (baseIndex < baseObj.length) {
          // Use the timing from the corresponding position in baseObj
          const baseWord = baseObj[baseIndex];
          result.push({
            text: word,
            start: baseWord.start,
            duration: baseWord.end - baseWord.start,
            end: baseWord.end
          });
          baseIndex++;
        } else {
          // If we've run out of base words, estimate timing for additional words
          const lastWord = result[result.length - 1];
          const start = lastWord.end + 1;
          const duration = Math.round(lastWord.duration * (word.length / lastWord.text.length)); // Estimate duration based on word length
          const end = start + duration;
          result.push({ text: word, start, duration, end });
        }
      }
    
      return result;
    }
};

// required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { softalign };
}