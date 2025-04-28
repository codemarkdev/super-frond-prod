export function generateYearRange(startYear, endYear) {
	const years = [];
	for (let year = startYear; year <= endYear; year++) {
		years.push(year);
	}
	return years;
}
