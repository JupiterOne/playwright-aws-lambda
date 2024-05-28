%.zip:
	npm i
	tsc
	mkdir -p nodejs/node_modules/playwright-aws-lambda/
	cd nodejs/ && npm install lambdafs@~1.3.0 playwright-core@~1.3.0 --no-bin-links --no-optional --no-package-lock --no-save --no-shrinkwrap && cd -
	cp -R ./src/bin/ ./dist/src/bin/
	npm pack
	tar --directory nodejs/node_modules/playwright-aws-lambda/ --extract --file playwright-aws-lambda-*.tgz --strip-components=1
	rm playwright-aws-lambda-*.tgz
	mkdir -p $(dir $@)
	zip -9 --filesync --move --recurse-paths $@ nodejs/
