// language: C, file: src/main.c, target: POSIX / CLI
#include "../include/wf_dsp_core.h"
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
    printf("[WindyFork] Acoustic Anemometer Pipeline v0.4.1\n");

    const char *lut_file = "calibration/lut_matrix_100hz_chA.bin";
    if (argc > 1) {
        lut_file = argv[1];
    }

    wf_sensor_ctx_t ctx = {
        .sample_rate = 192000,
        .channel_count = 6,
        .temp_compensation = 22.5f,
        .calib_lut_buffer = NULL,
        .calib_lut_size = 0
    };

    printf("[Init] Loading static calibration LUT: %s\n", lut_file);
    extern int wf_load_calibration_lut(const char *bin_path, wf_sensor_ctx_t *ctx);
    extern void wf_free_lut(wf_sensor_ctx_t *ctx);

    int rc = wf_load_calibration_lut(lut_file, &ctx);
    if (rc != 0) {
        fprintf(stderr, "[Warn] Calibration payload missing or invalid (err=%d). Using default synthesis.\n", rc);
    } else {
        printf("[Ready] LUT mapped into memory: %zu bytes\n", ctx.calib_lut_size);
    }

    int16_t mock_adc_frame[6] = { 450, 462, 448, 440, 452, 451 };
    float wind_vector[3] = {0};

    wf_process_frame(mock_adc_frame, wind_vector);

    printf("[Output] Vector: u=%.3f m/s, v=%.3f m/s, w=%.3f m/s\n", 
           wind_vector[0], wind_vector[1], wind_vector[2]);

    wf_free_lut(&ctx);
    return 0;
}
