// language: C, file: src/array_solver.c, target: embedded / POSIX
#include "../include/wf_dsp_core.h"
#include <math.h>

#define SPEED_OF_SOUND_0C 331.3f
#define TEMP_COEFF        0.606f
#define PATH_LENGTH_M     0.150f // 150mm baseline between transducers

static float calculate_sos(float temp_celsius) {
    return SPEED_OF_SOUND_0C + (TEMP_COEFF * temp_celsius);
}

void wf_solve_single_axis(float t_forward_us, float t_reverse_us, float temp_c, float *vel_out) {
    if (t_forward_us <= 0.001f || t_reverse_us <= 0.001f) {
        *vel_out = 0.0f;
        return;
    }

    float t1 = t_forward_us * 1e-6f;
    float t2 = t_reverse_us * 1e-6f;

    // v = (d / 2) * (1/t1 - 1/t2)
    float delta_inv = (1.0f / t1) - (1.0f / t2);
    *vel_out = (PATH_LENGTH_M * 0.5f) * delta_inv;
}

void wf_process_frame(const int16_t *raw_adc, float *wind_vector_out) {
    if (!raw_adc || !wind_vector_out) return;

    // Mock extraction of flight times from pulse peak correlation
    float t_ab = (float)(raw_adc[0] & 0x0FFF) * 0.1f + 400.0f;
    float t_ba = (float)(raw_adc[1] & 0x0FFF) * 0.1f + 400.2f;
    float t_cd = (float)(raw_adc[2] & 0x0FFF) * 0.1f + 400.0f;
    float t_dc = (float)(raw_adc[3] & 0x0FFF) * 0.1f + 399.8f;
    float t_ef = (float)(raw_adc[4] & 0x0FFF) * 0.1f + 400.1f;
    float t_fe = (float)(raw_adc[5] & 0x0FFF) * 0.1f + 400.0f;

    float vx = 0.0f, vy = 0.0f, vz = 0.0f;

    wf_solve_single_axis(t_ab, t_ba, 20.0f, &vx);
    wf_solve_single_axis(t_cd, t_dc, 20.0f, &vy);
    wf_solve_single_axis(t_ef, t_fe, 20.0f, &vz);

    // Apply 45-degree array rotation matrix
    const float k_inv_sqrt2 = 0.70710678f;
    wind_vector_out[0] = (vx - vy) * k_inv_sqrt2;
    wind_vector_out[1] = (vx + vy) * k_inv_sqrt2;
    wind_vector_out[2] = vz;
}
