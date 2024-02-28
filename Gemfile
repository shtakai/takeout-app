source 'https://rubygems.org'
ruby '~> 3.0.2' if ENV['STACK'] || ENV['IS_HEROKU']

gem 'rails', '~> 6.1.7'
gem 'pg', '~> 1.1'
gem 'puma', '~> 5.0'
gem 'sass-rails', '>= 6'

gem 'jsonnet'
gem 'jwt'

gem 'aws-sdk-core' # sts
gem 'aws-sdk-s3'
gem 'aws-sdk-chimesdkidentity'
gem 'aws-sdk-chimesdkmessaging'
gem 'aws-sdk-ivs'
gem 'aws-sdk-medialive'

gem 'shoryuken'
gem 'aws-sdk-sqs'

gem 'simpacker'
gem 's3_assets_uploader'

gem 'http-2'
gem 'aws-sdk-transcribestreamingservice'

gem "sentry-ruby"
gem "sentry-rails"
gem "barnes"

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  gem 'listen', '~> 3.3'
end
