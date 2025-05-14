export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
    { id: 'basic', name: 'Basic', credits: 5, price: 1.00 },
    { id: 'standard', name: 'Standard', credits: 25, price: 4.00 },
    { id: 'premium', name: 'Premium', credits: 55, price: 8.00 }
];

export function getCreditPackageById(packageId: string): CreditPackage | undefined {
    return CREDIT_PACKAGES.find(p => p.id === packageId);
}