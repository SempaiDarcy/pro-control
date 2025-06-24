import { API_PATHS } from './api-paths';
import axiosInstance from './axios-instance';

// Функция для загрузки изображения на сервер
export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Добавляем изображение в объект formData
    formData.append('image', imageFile);

    try {
        // Отправка POST-запроса на сервер
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Заголовок для загрузки файлов
            },
        });

        // Возвращаем полученные данные (например, URL изображения)
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        throw error; // Пробрасываем ошибку выше для обработки
    }
};
