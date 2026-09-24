const DATETIME_LENGTH = 10;
/**
 * Formats date to yyyy-mm-dd format.
 * @param date - Date string or Date object.
 * @returns Date string in yyyy-mm-dd format.
 */
export function formatDate(date) {
    return new Date(date).toISOString().slice(0, DATETIME_LENGTH);
}
/**
 * Safe JSON.stringify with circular reference support.
 * @param obj
 * @returns Stringified object with circular references.
 */
export function stringify(obj) {
    const stack = [];
    const keys = [];
    let thisPos;
    const cycleReplacer = (value) => {
        if (stack[0] === value) {
            return '[Circular ~]';
        }
        return `[Circular ~.${keys.slice(0, stack.indexOf(value)).join('.')}]`;
    };
    function serializer(key, value) {
        let resultValue = value;
        if (stack.length > 0) {
            thisPos = stack.indexOf(this);
            if (thisPos !== -1) {
                stack.splice(thisPos + 1);
                keys.splice(thisPos, Infinity, key);
            }
            else {
                stack.push(this);
                keys.push(key);
            }
            if (stack.includes(resultValue)) {
                resultValue = cycleReplacer(resultValue);
            }
        }
        else {
            stack.push(resultValue);
        }
        return resultValue;
    }
    return JSON.stringify(obj, serializer, '  ');
}
/**
 * Creates a compare function for sorting from object keys.
 * @param strings - String or array of strings of object keys to compare.
 * @returns Compare function.
 */
export function createComparator(strings) {
    if (typeof strings === 'string') {
        return (a, b) => (a[strings] || '').localeCompare(b[strings] || '');
    }
    if (Array.isArray(strings)) {
        return (a, b) => {
            let strA = '';
            let strB = '';
            for (const key of strings) {
                strA += a[key] || '';
                strB += b[key] || '';
            }
            return strA.localeCompare(strB);
        };
    }
    return strings;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFBO0FBRTFCOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsVUFBVSxDQUN4QixJQUFtQjtJQUVuQixPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDL0QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLEdBQVk7SUFDcEMsTUFBTSxLQUFLLEdBQWMsRUFBRSxDQUFBO0lBQzNCLE1BQU0sSUFBSSxHQUFhLEVBQUUsQ0FBQTtJQUN6QixJQUFJLE9BQWUsQ0FBQTtJQUNuQixNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQWMsRUFBRSxFQUFFO1FBQ3ZDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sY0FBYyxDQUFBO1FBQ3ZCLENBQUM7UUFFRCxPQUFPLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFBO0lBQ3hFLENBQUMsQ0FBQTtJQUVELFNBQVMsVUFBVSxDQUFnQixHQUFXLEVBQUUsS0FBYztRQUM1RCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUE7UUFFdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBRTdCLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFBO2dCQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDckMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDaEIsQ0FBQztZQUVELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxXQUFXLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzFDLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDekIsQ0FBQztRQUVELE9BQU8sV0FBVyxDQUFBO0lBQ3BCLENBQUM7SUFFRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUM5QyxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FHOUIsT0FBNEM7SUFDNUMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsQ0FBSSxFQUFFLENBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUMzRSxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLENBQUksRUFBRSxDQUFJLEVBQUUsRUFBRTtZQUNwQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7WUFDYixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7WUFFYixLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtnQkFDcEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDdEIsQ0FBQztZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNqQyxDQUFDLENBQUE7SUFDSCxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQyJ9