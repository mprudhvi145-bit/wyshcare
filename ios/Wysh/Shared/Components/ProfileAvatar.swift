import SwiftUI

struct ProfileAvatar: View {
    let imageURL: URL?
    let initials: String
    let size: CGFloat

    init(initials: String, size: CGFloat = 48, imageURL: URL? = nil) {
        self.imageURL = imageURL
        self.initials = initials
        self.size = size
    }

    var body: some View {
        AsyncImage(url: imageURL) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipShape(Circle())

            default:
                Text(initials)
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundStyle(.blue)
                    .frame(width: size, height: size)
                    .background(.blue.opacity(0.1))
                    .clipShape(Circle())
            }
        }
    }
}
