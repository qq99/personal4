#!/usr/bin/env ruby
require 'fileutils'
require 'pathname'
include FileUtils


images = Dir.glob('img/*')

unprocessed = images.reject{|i| i.include?('crushed') || i.include?('small') }

unprocessed.each do |img|
  file = Pathname.new(img)
  filename = file.basename('.*').to_s
  extension = file.extname.to_s
  dir = file.dirname.to_s
  if ['.jpg', '.png', '.jpeg'].include?(extension)
    img_out = Dir.pwd + "/" + dir + '/' + filename + '.small' + extension
    img_out = img_out.to_s
    img_in = Dir.pwd + "/" + img
    %x[convert #{img_in} -resize x420\\> #{img_out}]
  end
end

# crush PNG:

images = Dir.glob('img/*')

unprocessed = images.select{|i| i.include?('small') && !i.include?('crushed') }

unprocessed.each do |img|
  file = Pathname.new(img)
  filename = file.basename('.*').to_s
  extension = file.extname.to_s
  dir = file.dirname.to_s
  if ['.png'].include?(extension)
    img_in = Dir.pwd + "/" + img
    %x[pngquant 32 #{img_in} --ext .crushed.png --force]
  end
end

#pngquant 32 img/*.png --ext .crushed.png --force

#puts unprocessed
