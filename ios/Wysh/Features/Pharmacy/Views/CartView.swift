import SwiftUI

struct CartView: View {
    var viewModel: PharmacyViewModel
    @Environment(\.dismiss)
    private var dismiss
    @State private var showCheckout = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.cartItems.isEmpty {
                    emptyCart
                } else {
                    cartContent
                }
            }
            .navigationTitle("Cart")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
            .alert("Order Placed!", isPresented: $showCheckout) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your order has been placed successfully. Track it in Orders.")
            }
        }
    }

    private var emptyCart: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundColor(.secondary.opacity(0.5))
            Text("Your Cart is Empty")
                .font(.title3.weight(.semibold))
            Text("Browse medicines and add items to your cart.")
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var cartContent: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 10) {
                    ForEach(viewModel.cartItems) { item in
                        CartItemRow(item: item, viewModel: viewModel)
                    }
                }
                .padding()
            }

            checkoutBar
        }
    }

    private var checkoutBar: some View {
        VStack(spacing: 12) {
            Divider()

            HStack {
                Text("Total")
                    .font(.headline.weight(.semibold))
                Spacer()
                Text("₹\(viewModel.cartTotal)")
                    .font(.title3.weight(.bold))
                    .foregroundColor(.blue)
            }
            .padding(.horizontal)

            Button {
                showCheckout = true
            } label: {
                Text("Proceed to Checkout")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding([.horizontal, .bottom])
        }
        .background(Color(.systemBackground))
    }
}

struct CartItemRow: View {
    let item: CartItem
    var viewModel: PharmacyViewModel

    var body: some View {
        HStack(spacing: 12) {
            itemIcon
            itemInfo
            Spacer()
            quantityStepper
            itemPrice
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var itemIcon: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.blue.opacity(0.06))
                .frame(width: 52, height: 52)
            Image(systemName: "pills.fill")
                .font(.system(size: 24))
                .foregroundColor(.blue.opacity(0.5))
        }
    }

    private var itemInfo: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(item.medicine.name)
                .font(.subheadline.weight(.semibold))
            Text(item.medicine.manufacturer)
                .font(.caption)
                .foregroundColor(.secondary)
            Text("₹\(item.medicine.price) each")
                .font(.caption)
                .foregroundColor(.blue)
        }
    }

    private var quantityStepper: some View {
        HStack(spacing: 12) {
            Button {
                viewModel.decrementQuantity(item)
            } label: {
                Image(systemName: "minus.circle")
                    .font(.system(size: 22))
                    .foregroundColor(.blue)
            }

            Text("\(item.quantity)")
                .font(.subheadline.weight(.semibold))
                .frame(minWidth: 24)

            Button {
                viewModel.incrementQuantity(item)
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.blue)
            }
        }
    }

    private var itemPrice: some View {
        Text("₹\(item.medicine.price * item.quantity)")
            .font(.subheadline.weight(.bold))
            .frame(width: 60, alignment: .trailing)
    }
}

#Preview {
    let vm = PharmacyViewModel()
    return CartView(viewModel: vm)
}
