mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DTARGET_ARCH=CORTEX_M7 ..
make -j4
