cmake_minimum_required(VERSION 3.16)
project(WindyFork C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -O2 -ffast-math")

include_directories(include)

set(SOURCES
    src/main.c
    src/array_solver.c
    src/phase_lut.c
)

add_executable(windy_dsp_test ${SOURCES})
target_link_libraries(windy_dsp_test m)
