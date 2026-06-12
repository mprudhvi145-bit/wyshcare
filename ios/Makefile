.PHONY: project lint lint-fix build archive clean

project:
	@if command -v xcodegen &> /dev/null; then \
		xcodegen generate; \
		echo "✅ Xcode project generated."; \
	else \
		echo "❌ XcodeGen not installed. Install via: brew install xcodegen"; \
	fi

lint:
	@if command -v swiftlint &> /dev/null; then \
		swiftlint; \
	else \
		echo "❌ SwiftLint not installed. Install via: brew install swiftlint"; \
	fi

lint-fix:
	@if command -v swiftlint &> /dev/null; then \
		swiftlint --fix; \
	else \
		echo "❌ SwiftLint not installed. Install via: brew install swiftlint"; \
	fi

build:
	xcodebuild -scheme Wysh -destination 'generic/platform=iOS' -configuration Debug build

archive:
	xcodebuild -scheme Wysh -destination 'generic/platform=iOS' -configuration Release archive

clean:
	xcodebuild clean
	rm -rf ~/Library/Developer/Xcode/DerivedData
