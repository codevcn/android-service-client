import { AxiosError, CanceledError } from "axios"
import type { THandledAxiosError, THttpErrorResBody } from "./types"
import { HttpStatusCode } from "axios"

class AxiosErrorHandler {
  private readonly MAX_LEN_OF_ERROR_MESSAGE: number = 100

  handleHttpError(
    originalError: unknown | Error | AxiosError<THttpErrorResBody>,
  ): THandledAxiosError {
    let statusCode: HttpStatusCode = HttpStatusCode.InternalServerError
    let message: string = "Unknown Error!"
    let isCanceled: boolean = false

    console.error(">>> axios error", originalError)

    if (this.isAxiosError(originalError)) {
      const errorResponse = originalError.response

      if (errorResponse) {
        //if error was made by server at backend

        statusCode = errorResponse.status //update error status

        const responseData: THttpErrorResBody = errorResponse.data

        if (typeof responseData === "string") {
          message = "Invalid request"
        } else {
          message = responseData.error //update error message

          if (message && message.length > this.MAX_LEN_OF_ERROR_MESSAGE) {
            message = `${message.slice(0, this.MAX_LEN_OF_ERROR_MESSAGE)}...`
          }
        }
      } else if (originalError.request) {
        //The request was made but no response was received
        statusCode = HttpStatusCode.BadGateway
        message = "Bad network or error from server."
      } else {
        //Something happened in setting up the request that triggered an Error
        message = originalError.message
      }
    } else if (originalError instanceof CanceledError) {
      isCanceled = true
      message = originalError.message
    } else if (originalError instanceof Error) {
      message = originalError.message
    }

    return {
      originalError,
      statusCode,
      message,
      isCanceled,
    }
  }

  isAxiosError<T = any, D = any>(error: any): error is AxiosError<T, D> {
    return error instanceof AxiosError
  }
}

const axiosErrorHandler = new AxiosErrorHandler()

export default axiosErrorHandler
