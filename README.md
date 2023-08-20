## Create IVF named output.ivf that contains a VP8 track

`ffmpeg -i $INPUT_FILE -g 30 -b:v 2M output.ivf`

put output.ivf into `server` folder
