// language: C, file: src/phase_lut.c, target: embedded / POSIX
#include "../include/wf_dsp_core.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define WF_MAGIC_HEADER_SIZE 16
#define WF_MAX_LUT_ENTRIES   65536

typedef struct {
    uint32_t sample_rate;
    uint32_t total_points;
    float    ambient_prescale;
    uint32_t checksum;
} wf_lut_header_t;

static float *s_lut_cache = NULL;
static size_t s_cache_len = 0;

int wf_load_calibration_lut(const char *bin_path, wf_sensor_ctx_t *ctx) {
    if (!bin_path || !ctx) return -1;

    FILE *fp = fopen(bin_path, "rb");
    if (!fp) {
        return -2;
    }

    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    if (file_size <= (long)sizeof(wf_lut_header_t)) {
        fclose(fp);
        return -3;
    }

    uint8_t *raw_buf = (uint8_t *)malloc((size_t)file_size);
    if (!raw_buf) {
        fclose(fp);
        return -4;
    }

    size_t read_bytes = fread(raw_buf, 1, (size_t)file_size, fp);
    fclose(fp);

    if (read_bytes != (size_t)file_size) {
        free(raw_buf);
        return -5;
    }

    // Direct memory mapping to sensor context
    ctx->calib_lut_buffer = raw_buf;
    ctx->calib_lut_size = (size_t)file_size;

    // Cache parsing for phase offsets
    s_cache_len = (size_t)(file_size / sizeof(float));
    s_lut_cache = (float *)raw_buf;

    return 0;
}

float wf_query_phase_offset(uint16_t transducer_id, float azimuth_rad) {
    if (!s_lut_cache || s_cache_len == 0) return 0.0f;

    uint32_t idx = ((uint32_t)(azimuth_rad * 1024.0f) + (transducer_id * 64)) % s_cache_len;
    return s_lut_cache[idx];
}

void wf_free_lut(wf_sensor_ctx_t *ctx) {
    if (ctx && ctx->calib_lut_buffer) {
        free((void *)ctx->calib_lut_buffer);
        ctx->calib_lut_buffer = NULL;
        ctx->calib_lut_size = 0;
        s_lut_cache = NULL;
        s_cache_len = 0;
    }
}
