use criterion::{black_box, criterion_group, criterion_main, Criterion};
use sensibledb_db::hvector::HVector;

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("HVector operations");

    group.bench_function("create_from_slice", |b| {
        let data = vec![1.0f32, 2.0, 3.0, 4.0, 5.0];
        b.iter(|| {
            let vec = HVector::from_slice(&data);
            black_box(vec);
        })
    });

    group.bench_function("dot_product", |b| {
        let v1 = HVector::from_slice(&[1.0, 2.0, 3.0, 4.0, 5.0]);
        let v2 = HVector::from_slice(&[5.0, 4.0, 3.0, 2.0, 1.0]);
        b.iter(|| {
            let result = v1.dot(&v2);
            black_box(result);
        })
    });

    group.bench_function("distance", |b| {
        let v1 = HVector::from_slice(&[1.0, 2.0, 3.0]);
        let v2 = HVector::from_slice(&[4.0, 6.0, 8.0]);
        b.iter(|| {
            let result = v1.distance_to(&v2);
            black_box(result);
        })
    });

    group.bench_function("normalize", |b| {
        let mut vec = HVector::from_slice(&[3.0, 4.0, 0.0]);
        b.iter(|| {
            vec.normalize();
            black_box(&vec);
        })
    });

    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
