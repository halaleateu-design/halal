# EatHalal customer promo — 1080x1920 Reels/Stories
# Real photography + app mockup

ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 assets/people-meal.jpg 2>$null

$ffmpeg = (Get-Command ffmpeg).Source
$font = "C\:/Windows/Fonts/segoeui.ttf"
$out = "assets/go-customer-promo.mp4"
$dir = "C:\Users\Pakistan\halal-food-website\demos"
Set-Location $dir

# Build filter: 6 scenes x ~5s = ~30s, 1080x1920
$fc = @"
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=4.5:d=0.5,drawtext=fontfile=${font}:text='Real food. Real people.':fontsize=52:fontcolor=white:borderw=2:bordercolor=black@0.4:x=(w-text_w)/2:y=h*0.78:enable='between(t,0.3,4.8)',drawtext=fontfile=${font}:text='100% halal — no guessing':fontsize=36:fontcolor=#c9a227:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.85:enable='between(t,0.5,4.8)'[v0];
[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:#e8dfd2,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=4.5:d=0.5,drawtext=fontfile=${font}:text='EatHalal in your pocket':fontsize=48:fontcolor=white:borderw=2:bordercolor=black@0.45:x=(w-text_w)/2:y=h*0.82:enable='between(t,0.3,4.8)'[v1];
[2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=4.5:d=0.5,drawtext=fontfile=${font}:text='From real kitchens':fontsize=52:fontcolor=white:borderw=2:bordercolor=black@0.4:x=(w-text_w)/2:y=h*0.78:enable='between(t,0.3,4.8)',drawtext=fontfile=${font}:text='Muslim-made · verified partners':fontsize=32:fontcolor=#c9a227:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.85:enable='between(t,0.5,4.8)'[v2];
[3:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=4.5:d=0.5,drawtext=fontfile=${font}:text='Browse. Order. Done.':fontsize=52:fontcolor=white:borderw=2:bordercolor=black@0.4:x=(w-text_w)/2:y=h*0.78:enable='between(t,0.3,4.8)',drawtext=fontfile=${font}:text='3 taps · clear prices':fontsize=34:fontcolor=#c9a227:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.85:enable='between(t,0.5,4.8)'[v3];
[4:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,fade=t=out:st=4.5:d=0.5,drawtext=fontfile=${font}:text='Know when it arrives':fontsize=50:fontcolor=white:borderw=2:bordercolor=black@0.4:x=(w-text_w)/2:y=h*0.78:enable='between(t,0.3,4.8)',drawtext=fontfile=${font}:text='Live rider tracking · Porto':fontsize=32:fontcolor=#c9a227:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.85:enable='between(t,0.5,4.8)'[v4];
[5:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4,drawtext=fontfile=${font}:text='Join EatHalal / GO':fontsize=52:fontcolor=white:borderw=2:bordercolor=black@0.4:x=(w-text_w)/2:y=h*0.74:enable='between(t,0.3,5.8)',drawtext=fontfile=${font}:text='Comida halal perto de si':fontsize=34:fontcolor=#c9a227:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.82:enable='between(t,0.5,5.8)',drawtext=fontfile=${font}:text='eathalaleu.netlify.app':fontsize=30:fontcolor=white:borderw=1:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.89:enable='between(t,0.7,5.8)'[v5];
[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[outv]
"@

& $ffmpeg -y `
  -loop 1 -t 5 -i "assets/people-meal.jpg" `
  -loop 1 -t 5 -i "assets/eathalal-app-mockup.png" `
  -loop 1 -t 5 -i "assets/chef-food.jpg" `
  -loop 1 -t 5 -i "assets/kebab-plate.jpg" `
  -loop 1 -t 5 -i "assets/delivery-scooter.jpg" `
  -loop 1 -t 6 -i "assets/family-table.jpg" `
  -filter_complex $fc `
  -map "[outv]" `
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -movflags +faststart `
  $out

if (Test-Path $out) { Get-Item $out | Select-Object FullName, Length } else { Write-Host "FAILED" }
