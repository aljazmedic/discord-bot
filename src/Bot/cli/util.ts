export function table(arr2d: string[][]) {

    const text = arr2d.map(row => row.map((v => v.toString())).join(" ")).join("\n")
    return text;
}