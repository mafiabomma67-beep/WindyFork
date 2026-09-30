# WindyFork (v0.4.1-alpha)

*Forked from wind-acoustics/core-dsp-arm (archived)*  
Maintained by: `@mafiabomma67`

Open-source real-time signal processing engine for multi-path ultrasonic wind anemometers and turbulence kinetic energy (TKE) measurement arrays.

## Overview

WindyFork provides low-latency fixed-point math routines optimized for ARM Cortex-M7 / Cortex-R4 targets. It handles multi-channel transit-time calculation across spatial acoustic paths (6-axis transducer geometries).

The repository includes pre-baked calibration vectors and spatial beamforming lookup tables (LUT) required for phase alignment under dynamic thermal drift.

## Build

```bash
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DTARGET_ARCH=CORTEX_M7 ..
make -j4
