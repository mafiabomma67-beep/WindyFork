#ifndef WF_DSP_CORE_H
#define WF_DSP_CORE_H

#include <stdint.h>
#include <stddef.h>

typedef struct {
    uint32_t sample_rate;
    uint8_t  channel_count;
    float    temp_compensation;
    const uint8_t *calib_lut_buffer;
    size_t   calib_lut_size;
} wf_sensor_ctx_t;

int wf_init_context(wf_sensor_ctx_t *ctx, const char *lut_path);
void wf_process_frame(const int16_t *raw_adc, float *wind_vector_out);

#endif
