import Observation
import SwiftUI

struct CartItem: Identifiable {
    let id = UUID()
    let medicine: Medicine
    var quantity: Int
}

@Observable
final class PharmacyViewModel {
    var medicines: [Medicine] = []
    var cartItems: [CartItem] = []
    var orders: [LabOrder] = []
    var isLoading = false

    var featuredMedicines: [Medicine] {
        Array(medicines.prefix(8))
    }

    var cartItemCount: Int {
        cartItems.reduce(0) { $0 + $1.quantity }
    }

    var cartTotal: Int {
        cartItems.reduce(0) { $0 + $1.medicine.price * $1.quantity }
    }

    deinit {}

    func loadMedicines() async {
        isLoading = true
        try? await Task.sleep(nanoseconds: 500_000_000)
        medicines = sampleMedicines
        isLoading = false
    }

    func addToCart(_ medicine: Medicine, quantity: Int = 1) {
        if let index = cartItems.firstIndex(where: { $0.medicine.id == medicine.id }) {
            cartItems[index].quantity += quantity
        } else {
            cartItems.append(CartItem(medicine: medicine, quantity: quantity))
        }
    }

    func incrementQuantity(_ item: CartItem) {
        guard let index = cartItems.firstIndex(where: { $0.id == item.id }) else { return }
        cartItems[index].quantity += 1
    }

    func decrementQuantity(_ item: CartItem) {
        guard let index = cartItems.firstIndex(where: { $0.id == item.id }) else { return }
        if cartItems[index].quantity > 1 {
            cartItems[index].quantity -= 1
        } else {
            cartItems.remove(at: index)
        }
    }

    func removeFromCart(_ item: CartItem) {
        cartItems.removeAll { $0.id == item.id }
    }

    func clearCart() {
        cartItems.removeAll()
    }

    private var sampleMedicines: [Medicine] {
        [
            Medicine(name: "Paracetamol 500mg", manufacturer: "GSK", price: 35, originalPrice: 45, description: "Effective pain reliever and fever reducer. Used for headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.", category: .painRelief, requiresPrescription: false, rating: 4.5, unit: "Strip of 15 tablets"),
            Medicine(name: "Amoxicillin 500mg", manufacturer: "Cipla", price: 120, originalPrice: 150, description: "Antibiotic used to treat bacterial infections including pneumonia, bronchitis, and ear/nose/throat infections.", category: .antibiotics, requiresPrescription: true, rating: 4.3, unit: "Strip of 10 capsules"),
            Medicine(name: "Vitamin D3 60K", manufacturer: "Abbott", price: 249, originalPrice: 299, description: "Vitamin D supplement for bone health and immunity. Weekly dosage for vitamin D deficiency.", category: .vitamins, requiresPrescription: false, rating: 4.7, unit: "Pack of 4 capsules"),
            Medicine(name: "Metformin 500mg", manufacturer: "USV Ltd", price: 89, originalPrice: 120, description: "First-line medication for type 2 diabetes. Improves blood sugar control and insulin sensitivity.", category: .diabetes, requiresPrescription: true, rating: 4.5, unit: "Strip of 10 tablets"),
            Medicine(name: "Aspirin 75mg", manufacturer: "Bayer", price: 45, originalPrice: 60, description: "Low-dose aspirin for heart attack and stroke prevention. Blood thinning medication.", category: .heart, requiresPrescription: true, rating: 4.4, unit: "Strip of 14 tablets"),
            Medicine(name: "Omeprazole 20mg", manufacturer: "Dr. Reddy's", price: 78, originalPrice: 95, description: "Proton pump inhibitor for acid reflux, GERD, and stomach ulcers.", category: .stomach, requiresPrescription: false, rating: 4.2, unit: "Strip of 10 capsules"),
            Medicine(name: "Cetirizine 10mg", manufacturer: "Alkem", price: 55, originalPrice: 70, description: "Antihistamine for allergy relief including hay fever, hives, and allergic rhinitis.", category: .cold, requiresPrescription: false, rating: 4.6, unit: "Strip of 10 tablets"),
            Medicine(name: "Clotrimazole Cream", manufacturer: "Glenmark", price: 89, originalPrice: 110, description: "Antifungal cream for skin infections including athlete's foot, ringworm, and jock itch.", category: .skin, requiresPrescription: false, rating: 4.1, unit: "15g tube"),
            Medicine(name: "Atorvastatin 10mg", manufacturer: "Pfizer", price: 145, originalPrice: 180, description: "Statin medication for lowering cholesterol and preventing cardiovascular disease.", category: .heart, requiresPrescription: true, rating: 4.5, unit: "Strip of 10 tablets"),
            Medicine(name: "Azithromycin 500mg", manufacturer: "Zydus", price: 168, originalPrice: 210, description: "Macrolide antibiotic for respiratory infections, skin infections, and STDs.", category: .antibiotics, requiresPrescription: true, rating: 4.3, unit: "Strip of 3 tablets"),
            Medicine(name: "Multivitamin Tablets", manufacturer: "Himalaya", price: 199, originalPrice: 249, description: "Daily multivitamin supplement with essential vitamins and minerals for overall health.", category: .vitamins, requiresPrescription: false, rating: 4.4, unit: "Bottle of 60 tablets"),
            Medicine(name: "Insulin Glargine", manufacturer: "Sanofi", price: 850, originalPrice: nil, description: "Long-acting insulin for diabetes management. Once-daily injection for basal glucose control.", category: .diabetes, requiresPrescription: true, rating: 4.6, unit: "5 pens pack")
        ]
    }
}
