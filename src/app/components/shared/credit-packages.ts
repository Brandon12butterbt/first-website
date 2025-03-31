export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
    { id: 'basic', name: 'Basic', credits: 10, price: 5.00 },
    { id: 'standard', name: 'Standard', credits: 50, price: 20.00 },
    { id: 'premium', name: 'Premium', credits: 120, price: 40.00 }
];

export function getCreditPackageById(packageId: string): CreditPackage | undefined {
    return CREDIT_PACKAGES.find(p => p.id === packageId);
}