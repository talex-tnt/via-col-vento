export function fitTextToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialFontSize = 32, minFontSize = 8, fontFamily = 'Arial', bold = true) {
	let fontSize = initialFontSize;
	let lastWidth = Infinity;

	for (let i = 0; i < 10; i++) { // Limit iterations to avoid infinite loop
		ctx.font = `${bold ? 'bold ': ''}${fontSize}px ${fontFamily}`;
		const metrics = ctx.measureText(text);
		const width = metrics.width;
		if (width <= maxWidth || width === lastWidth) {
			break;
		}
		const ratio = maxWidth / width;
		fontSize = Math.max(Math.floor(fontSize * ratio), minFontSize);
		lastWidth = width;
	}
	return fontSize;
}