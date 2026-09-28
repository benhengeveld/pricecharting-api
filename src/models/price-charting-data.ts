export interface PriceChartingProduct {
	id: string;
	productName: string;
	consoleName: string;
	genre: string;
	upc: string;
	releaseDate: string;
	pricing: {
		loosePrice: number;
		cibPrice: number;
		newPrice: number;
		gradedPrice: number;
		boxOnlyPrice: number;
		manualOnlyPrice: number;
	};
}
